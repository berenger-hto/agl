import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Employee {
    matricule_employe: number;
    nom_employe: string;
    prenom_employe: string;
    poste?: string;
    children?: Employee[];
}

interface OrgChartProps {
    data: Employee[];
}

const OrgChart = ({ data }: OrgChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        // Clear previous render
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 800;
        const height = 400;

        // Create root hierarchy
        // If multiple roots, we might need a dummy root, but for now assume one DG
        const rootData = data[0];
        if (!rootData) return;

        const root = d3.hierarchy<Employee>(rootData);

        // Tree layout configuration
        const treeLayout = d3.tree<Employee>().size([width - 100, height - 100]);
        treeLayout(root);

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(50, 50)");

        // Links
        svg.selectAll(".link")
            .data(root.links())
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#e2e8f0")
            .attr("stroke-width", 2)
            .attr("d", d3.linkVertical()
                .x((d: any) => d.x)
                .y((d: any) => d.y) as any
            );

        // Nodes
        const nodes = svg.selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Node Circles
        nodes.append("circle")
            .attr("r", 20)
            .attr("fill", "#fff")
            .attr("stroke", "#3b19e6")
            .attr("stroke-width", 2);

        // Initials inside circles
        nodes.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("fill", "#3b19e6")
            .text((d: any) => {
                return `${d.data.prenom_employe[0]}${d.data.nom_employe[0]}`;
            });

        // Name labels
        nodes.append("text")
            .attr("dy", "35px")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#1e293b")
            .text((d: any) => d.data.nom_employe);

        // Role labels
        nodes.append("text")
            .attr("dy", "50px")
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", "#64748b")
            .text((d: any) => d.data.poste || 'Employé');

    }, [data]);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-center overflow-x-auto">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default OrgChart;
