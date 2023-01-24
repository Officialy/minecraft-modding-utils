import {CubeBuilderDefinition, NewParts, PartDefinitionBuilder, PartPose, Pos} from "./convert-legacy-model";


export function modelTemplate(props: {fileName: string, baseParts: NewParts, textureWidth: number, textureHeight: number}) : string {

    return `package setme;

package reika.rotarycraft.models.engine;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.blaze3d.vertex.VertexConsumer;
import com.mojang.math.Axis;
import net.minecraft.client.model.geom.ModelPart;
import net.minecraft.client.model.geom.PartPose;
import net.minecraft.client.model.geom.builders.CubeListBuilder;
import net.minecraft.client.model.geom.builders.LayerDefinition;
import net.minecraft.client.model.geom.builders.MeshDefinition;
import net.minecraft.client.renderer.RenderType;
import net.minecraft.client.renderer.texture.OverlayTexture;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.level.block.entity.BlockEntity;
import reika.rotarycraft.base.RotaryModelBase;
import java.util.ArrayList;

import static reika.rotarycraft.RotaryCraft.MODID;

public class ${props.fileName} extends RotaryModel<T>
{
    
    public static final ResourceLocation TEXTURE_LOCATION = new ResourceLocation(MODID, "changeme");

    public ${props.fileName}(ModelPart modelPart) {
        super(modelPart);
    }

    // Grab the parts in the constructor if you need them
    
    public static LayerDefinition createLayer() {
        //MeshDefinition definition = new MeshDefinition();
        MeshDefinition definition = ModelUtils.createBlankHumanoidMesh();
        PartDefinition root = definition.getRoot();${generateModelCode(props.baseParts)}
        
        return LayerDefinition.create(definition, ${jn(props.textureWidth)}, ${jn(props.textureHeight)});
    }

    // May need to implement the rendering parts depending on what you are doing
}
`;
}

function generateCubeBuilder(cubes: CubeBuilderDefinition): string {

    // At the moment due to the old models a lot will only contain one box, but thats no issue. Just improve efficiency in the future if needed!
    // Also old versions of the model editor could not mirror specific boxes, only the renderer.
    let cubeBuilderInstructions = cubes.boxes.map((box) => {
        return `
                .addBox(${jn(box.offset.x)}, ${jn(box.offset.y)}, ${jn(box.offset.z)}, ${jn(box.size.x)}, ${jn(box.size.y)}, ${jn(box.size.z)})`
    });
    return `CubeListBuilder.create()${cubes.mirror ? `
                .mirror(true)` : ""}
                .texOffs(${cubes.texCoord.x}, ${cubes.texCoord.y})${cubeBuilderInstructions.join('')}`;
}


function generatePartPose(partPose: PartPose): string {
    // check if the texture position has moved
    return partPose.isZero() ? "PartPose.ZERO" : `PartPose.offsetAndRotation(${jn(partPose.pos.x)}, ${jn(partPose.pos.y)}, ${jn(partPose.pos.z)}, ${jn(partPose.rot.x)}, ${jn(partPose.rot.y)}, ${jn(partPose.rot.z)})`;
}

/**
 * Just a quick wrapper
 * @param number
 */
function jn(number: number): string {
    return `${number}${number % 1 === 0 ? "" : "F"}`
}

function generateDefinitionsForPart(part: PartDefinitionBuilder, parentName?: string): string {
    const entries = Object.keys(part.children);
    const hasChildren = entries.length > 0;
    const childContents = hasChildren ? entries
        .map(key => part.children[key])
        .map(child => {
            return generateDefinitionsForPart(child, part.name);
        }).reduce((a,b) => {
            return a + b;
        }) : "";

    return `
        
        ${hasChildren ? `PartDefinition ${part.name} = ` : ""}${parentName || "root"}.addOrReplaceChild("${part.name}",
            ${generateCubeBuilder(part.cubeBuilder)},
            ${generatePartPose(part.partPose)});${childContents}`;
}

function generateModelCode(parts: NewParts): string {
    let value = "";

    for (const partName in parts) {
        const part = parts[partName];
        if(Object.keys(part.children).length == 0 && part.cubeBuilder.boxes.length == 0) {
            console.log("No parts or children found for", part.name);
            continue;
        }

        value += generateDefinitionsForPart(part);
    }

    return `${value}`;
}